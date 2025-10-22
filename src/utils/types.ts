export interface StringProperties {
  length: number;
  isPalindrome: boolean;
  uniqueCharacters: number;
  wordCount: number;
  sha256Hash: string;
  charFrequencyMap: Record<string, number>;
  createdAt?: string;
}

export interface StringResponse {
  id: string;
  value: string;
  properties: StringProperties;
  created_at: string;
}
