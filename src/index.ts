type Message = {
    headers: Map<string, string>;
    payload: Uint8Array;
};

type MessageCodec = {
    encode(message: Message): Uint8Array;
    decode(data: Uint8Array): Message;
};

const MAX_HEADER_LENGTH = 1023;
const MAX_HEADERS = 63;
const MAX_PAYLOAD_SIZE = 256 * 1024;

const createMessageCodec = (): MessageCodec => {
    const encode = (message: Message): Uint8Array => {
        validateMessage(message);

        const headerCount = Math.min(message.headers.size, MAX_HEADERS);
        const headerBytes: Uint8Array[] = [];

        // Encode headers
        let encodedHeaderCount = 0;
        for (const [name, value] of message.headers) {
            if (encodedHeaderCount >= headerCount) {
                break;
            }
            const nameBytes = encodeString(name);
            const valueBytes = encodeString(value);
            const headerData = new Uint8Array(2 + nameBytes.length + 2 + valueBytes.length);
            headerData.set(encodeBigEndian16(nameBytes.length), 0);
            headerData.set(nameBytes, 2);
            headerData.set(encodeBigEndian16(valueBytes.length), 2 + nameBytes.length);
            headerData.set(valueBytes, 2 + nameBytes.length + 2);

            headerBytes.push(headerData);
            encodedHeaderCount++;
        }

        const headerLength = headerBytes.reduce((sum, bytes) => sum + bytes.length, 0);
        const payloadLength = message.payload.length;
        const dataLength = 1 + headerLength + payloadLength;
        const data = new Uint8Array(dataLength);

        // Encode header count
        data[0] = headerCount;

        // Encode headers
        let offset = 1;
        for (const bytes of headerBytes) {
            data.set(bytes, offset);
            offset += bytes.length;
        }

        // Encode payload
        data.set(message.payload, offset);

        return data;
    };

    const decode = (data: Uint8Array): Message => {
        validateData(data);

        const headerCount = data[0];
        const headers = new Map<string, string>();
        let offset = 1;

        // Decode headers
        for (let i = 0; i < headerCount; i++) {
            const nameLength = decodeBigEndian16(data, offset);
            offset += 2;
            validateHeaderLength(nameLength);
            const name = decodeString(data, offset, nameLength);
            offset += nameLength;
            const valueLength = decodeBigEndian16(data, offset);
            offset += 2;
            validateHeaderLength(valueLength);
            const value = decodeString(data, offset, valueLength);
            offset += valueLength;
            headers.set(name, value);
        }

        // Decode payload
        const payload = data.slice(offset);

        return { headers, payload };
    };

    const encodeString = (value: string): Uint8Array => {
        const bytes = new Uint8Array(value.length);
        for (let i = 0; i < value.length; i++) {
            bytes[i] = value.charCodeAt(i);
        }
        return bytes;
    };

    const decodeString = (data: Uint8Array, offset: number, length: number): string => {
        let result = '';
        for (let i = offset; i < offset + length; i++) {
            result += String.fromCharCode(data[i]);
        }
        return result;
    };

    const encodeBigEndian16 = (value: number): Uint8Array => {
        const bytes = new Uint8Array(2);
        bytes[0] = (value >> 8) & 0xff;
        bytes[1] = value & 0xff;
        return bytes;
    };

    const decodeBigEndian16 = (data: Uint8Array, offset: number): number => {
        return (data[offset] << 8) | data[offset + 1];
    };

    const validateMessage = (message: Message): void => {
        if (message.headers.size > MAX_HEADERS) {
            throw new Error(`Maximum number of headers exceeded (${MAX_HEADERS})`);
        }

        validateHeaders(message.headers);

        if (message.payload.length > MAX_PAYLOAD_SIZE) {
            throw new Error(`Payload size exceeds the maximum limit (${MAX_PAYLOAD_SIZE} bytes)`);
        }
    };

    const validateHeaders = (headers: Map<string, string>): void => {
        for (const [name, value] of headers) {
            validateHeaderLength(name.length);
            validateHeaderLength(value.length);
        }
    };

    const validateHeaderLength = (length: number): void => {
        if (length > MAX_HEADER_LENGTH) {
            throw new Error(`Header length exceeds the maximum limit (${MAX_HEADER_LENGTH} bytes)`);
        }
        if (length <= 0) {
            throw new Error('Header length must be greater than 0');
        }
    };

    const validateData = (data: Uint8Array): void => {
        if (data.length === 0) {
            throw new Error('Data is empty');
        }
    };

    return { encode, decode };
};

export { createMessageCodec, Message, MessageCodec };
