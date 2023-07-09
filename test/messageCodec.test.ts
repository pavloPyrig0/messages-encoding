import { createMessageCodec, Message, MessageCodec } from '../src/index';

describe('Message Codec', () => {
    let messageCodec: MessageCodec;

    beforeEach(() => {
        messageCodec = createMessageCodec();
    });

    it('encodes and decodes a message correctly', () => {
        const originalMessage: Message = {
            headers: new Map([['Header1', 'Value1'], ['Header2', 'Value2']]),
            payload: new Uint8Array([1, 2, 3, 4, 5]),
        };

        const encodedData = messageCodec.encode(originalMessage);
        const decodedMessage = messageCodec.decode(encodedData);

        expect(decodedMessage.headers).toEqual(originalMessage.headers);
        expect(decodedMessage.payload).toEqual(originalMessage.payload);
    });

    it('encodes and decodes an empty message correctly', () => {
        const originalMessage: Message = {
            headers: new Map(),
            payload: new Uint8Array(),
        };

        const encodedData = messageCodec.encode(originalMessage);
        const decodedMessage = messageCodec.decode(encodedData);

        expect(decodedMessage.headers).toEqual(originalMessage.headers);
        expect(decodedMessage.payload).toEqual(originalMessage.payload);
    });

    it('encodes and decodes a message with maximum headers and payload size correctly', () => {
        const headers = new Map<string, string>();
        for (let i = 0; i < 63; i++) {
            headers.set(`Header${i}`, `Value${i}`);
        }
        const payload = new Uint8Array(256 * 1024);
        payload.fill(1);

        const originalMessage: Message = {
            headers,
            payload,
        };

        const encodedData = messageCodec.encode(originalMessage);
        const decodedMessage = messageCodec.decode(encodedData);

        expect(decodedMessage.headers).toEqual(originalMessage.headers);
        expect(decodedMessage.payload).toEqual(originalMessage.payload);
    });

    it('throws an error when encoding a message with too many headers', () => {
        const headers = new Map<string, string>();
        for (let i = 0; i < 64; i++) {
            headers.set(`Header${i}`, `Value${i}`);
        }
        const payload = new Uint8Array(256 * 1024);
        payload.fill(1);

        const originalMessage: Message = {
            headers,
            payload,
        };

        expect(() => messageCodec.encode(originalMessage)).toThrowError();
    });
});
