// Simple Obfuscator to hide raw DB IDs in URLs
// This is not cryptographically secure, it's just to prevent users from seeing raw 24-character hex strings

export const encodeId = (id) => {
  if (!id) return id;
  try {
    // Reverse the string and base64 encode it
    const reversed = id.toString().split('').reverse().join('');
    // base64 encode and make URL safe (remove padding =, replace + with -, replace / with _)
    return btoa(reversed).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  } catch (e) {
    return id;
  }
};

export const decodeId = (encoded) => {
  if (!encoded) return encoded;
  
  // If it's already a 24 character hex string (MongoDB ObjectId), it might not be encoded
  if (/^[0-9a-fA-F]{24}$/.test(encoded)) {
    return encoded;
  }

  try {
    // Restore base64 characters
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding back
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const decoded = atob(base64);
    return decoded.split('').reverse().join('');
  } catch (e) {
    // Fallback if decoding fails
    return encoded;
  }
};
