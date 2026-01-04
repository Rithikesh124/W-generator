import { wordlist } from './_wordlist.js';

export const config = {
  runtime: 'edge', // High performance globally
};

export default async function handler(req) {
  try {
    // 1. Generate 16 bytes (128 bits) of random entropy
    const entropy = crypto.getRandomValues(new Uint8Array(16));

    // 2. Compute SHA-256 hash for the checksum
    const hashBuffer = await crypto.subtle.digest('SHA-256', entropy);
    const hashArray = new Uint8Array(hashBuffer);
    
    // 3. Convert entropy to bit string
    let bits = "";
    for (const byte of entropy) {
      bits += byte.toString(2).padStart(8, '0');
    }

    // 4. Add Checksum (First 4 bits of the hash for 128-bit entropy)
    const checksumBits = hashArray[0].toString(2).padStart(8, '0').slice(0, 4);
    bits += checksumBits;

    // 5. Split into 11-bit chunks and map to words
    const phrase = [];
    for (let i = 0; i < bits.length; i += 11) {
      const index = parseInt(bits.slice(i, i + 11), 2);
      phrase.push(wordlist[index]);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      phrase: phrase.join(" ") 
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
  }
}
