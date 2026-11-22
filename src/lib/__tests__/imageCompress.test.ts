import { validatePickedFile, PROFILES, THUMBNAIL_PROFILE, formatByteSize } from "../imageCompress";
import { validateImageMagicBytes } from "../imageMagicBytes";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`Assertion failed: ${message}`);
    process.exit(1);
  }
}

console.log("Running unit tests for Image Compression and Validation module...");

// Test 1: File size validation
try {
  const fakeLargeFile = {
    name: "photo.jpg",
    type: "image/jpeg",
    size: 16 * 1024 * 1024, // 16 MB (> 15 MB cap)
  } as File;
  validatePickedFile(fakeLargeFile);
  assert(false, "Should reject files larger than 15 MB");
} catch (err: any) {
  assert(err.message.includes("File is too large"), "Correct error message on oversized original file");
}

// Test 2: File type validation
try {
  const fakePdf = {
    name: "document.pdf",
    type: "application/pdf",
    size: 200 * 1024,
  } as File;
  validatePickedFile(fakePdf);
  assert(false, "Should reject non-image file types");
} catch (err: any) {
  assert(err.message.includes("Unsupported file format"), "Correct error message on unsupported format");
}

// Test 3: Magic Bytes - JPEG
const fakeJpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
const jpegResult = validateImageMagicBytes(fakeJpegBytes);
assert(jpegResult.valid === true, "JPEG magic bytes detected as valid");
assert(jpegResult.mimeType === "image/jpeg", "JPEG mimeType parsed correctly");

// Test 4: Magic Bytes - PNG
const fakePngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
const pngResult = validateImageMagicBytes(fakePngBytes);
assert(pngResult.valid === true, "PNG magic bytes detected as valid");
assert(pngResult.mimeType === "image/png", "PNG mimeType parsed correctly");

// Test 5: Magic Bytes - WebP (RIFF....WEBP)
const fakeWebpBytes = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, // RIFF
  0x24, 0x00, 0x00, 0x00,
  0x57, 0x45, 0x42, 0x50, // WEBP
]);
const webpResult = validateImageMagicBytes(fakeWebpBytes);
assert(webpResult.valid === true, "WebP magic bytes detected as valid");
assert(webpResult.mimeType === "image/webp", "WebP mimeType parsed correctly");

// Test 6: Magic Bytes - Reject Fake Executable / Corrupted
const fakeExeBytes = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]);
const exeResult = validateImageMagicBytes(fakeExeBytes);
assert(exeResult.valid === false, "Executable bytes correctly rejected");

// Test 7: Target profile constraints
assert(PROFILES.POST.maxDimension === 1280, "POST profile max dimension is 1280px");
assert(PROFILES.POST.targetSizeBytes === 300 * 1024, "POST profile target size is 300 KB");
assert(PROFILES.ID_CARD.maxDimension === 1600, "ID_CARD profile max dimension is 1600px");
assert(PROFILES.ID_CARD.targetSizeBytes === 500 * 1024, "ID_CARD profile target size is 500 KB");
assert(PROFILES.ID_CARD.qualityFloor === 0.6, "ID_CARD quality floor is 0.6 for legibility");
assert(THUMBNAIL_PROFILE.maxDimension === 400, "Thumbnail profile max dimension is 400px");
assert(THUMBNAIL_PROFILE.targetSizeBytes === 40 * 1024, "Thumbnail profile target size is 40 KB");

// Test 8: Byte size formatter
assert(formatByteSize(512) === "512 B", "Format bytes under 1KB");
assert(formatByteSize(256 * 1024) === "256 KB", "Format KB");
assert(formatByteSize(4.2 * 1024 * 1024) === "4.2 MB", "Format MB");

console.log("All unit tests passed successfully.");
