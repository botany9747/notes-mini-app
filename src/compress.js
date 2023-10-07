// https://dev.to/samternent/json-compression-in-the-browser-with-gzip-and-the-compression-streams-api-4135

export function b64encode(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

export function b64decode(str) {
    const binary_string = window.atob(str);
    const len = binary_string.length;
    const bytes = new Uint8Array(new ArrayBuffer(len));
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}

export function JSONtoStream(data) {
    return new Blob([JSON.stringify(data)], {
        type: "text/plain"
    }).stream();
}

export function b64toStream(b64) {
    return new Blob([b64decode(b64)], {
        type: "text/plain"
    }).stream();
}

export async function responseToJSON(response) {
    const blob = await response.blob();
    return JSON.parse(await blob.text());
}

export async function responseToB64(response) {
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    return b64encode(buffer);
}

export async function responseToBuffer(response) {
    const blob = await response.blob();
    return blob.arrayBuffer();
}

export async function compressStream(stream) {
    const compressedReadableStream = stream.pipeThrough(
        new CompressionStream("gzip")
    );

    return new Response(compressedReadableStream);
}

export async function decompressStream(stream) {
    const compressedReadableStream = stream.pipeThrough(
        new DecompressionStream("gzip")
    );

    return new Response(compressedReadableStream);
}
