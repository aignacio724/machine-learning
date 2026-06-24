import { customAlphabet } from "nanoid";

// No 0/O or 1/l/I — avoids ambiguity when an id is read aloud or hand-copied.
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
const generate = customAlphabet(ALPHABET, 10);

export function generateEventId(): string {
  return generate();
}

export function generateParticipantId(): string {
  return generate();
}
