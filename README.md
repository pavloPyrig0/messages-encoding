## Usage

The code provided includes a TypeScript implementation of the binary message encoding scheme along with unit tests. The implementation includes a `MessageCodec` interface and a `createMessageCodec` function to create an instance of the codec.

## Installation

1. Clone the repository:

   ```bash
   git clone 
   ```
2. Install dependencies:

   ```bash
   cd binary-message-encoding
   npm install
   ```
## Example
Here's an example of how to use the `MessageCodec`:

      import { createMessageCodec, Message } from './src';
      
      // Create an instance of the message codec
      const messageCodec = createMessageCodec();
      
      // Create a message
      const message: Message = {
         headers: new Map([
            ['Header1', 'Value1'],
            ['Header2', 'Value2'],
         ]),
         payload: new Uint8Array([1, 2, 3, 4, 5]),
      };
      
      // Encode the message to binary
      const encodedData = messageCodec.encode(message);
      
      console.log(encodedData);
      
      // Decode the binary data back to a message
      const decodedMessage = messageCodec.decode(encodedData);
      
      console.log(decodedMessage);

## API Reference

### `createMessageCodec(): MessageCodec`

Creates an instance of the `MessageCodec` interface.

### `Message`

An interface representing a binary message.

- `headers`: A `Map` containing the header name-value pairs.
- `payload`: A `Uint8Array` representing the binary payload.

### `MessageCodec`

An interface for encoding and decoding binary messages.

- `encode(message: Message): Uint8Array`: Encodes a `Message` object into a `Uint8Array`.
- `decode(data: Uint8Array): Message`: Decodes a `Uint8Array` into a `Message` object.

## Limitations

- Header names and values are limited to ASCII-encoded strings.
- Header names and values are limited to 1023 bytes each.
- A message can have a maximum of 63 headers.
- The message payload is limited to 256 KiB.

## Testing

The project includes unit tests implemented using the Jest testing framework. To run the tests, use the following command:

```bash
npm test
```
