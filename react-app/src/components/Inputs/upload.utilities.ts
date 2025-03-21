import { API } from "aws-amplify";

export const getPresignedUrl = async (fileName: string): Promise<string> => {
  const response = await API.post("os", "/getUploadUrl", {
    body: { fileName },
  });
  return response.url;
};

export const uploadToS3 = async (file: File, url: string): Promise<void> => {
  await fetch(url, {
    body: file,
    method: "PUT",
  });
};

export const extractBucketAndKeyFromUrl = (
  url: string,
): {
  bucket: string | null;
  key: string | null;
} => {
  try {
    const parsedUrl = new URL(url);

    const hostnameParts = parsedUrl.hostname.split(".");
    let bucket: string | null = null;
    let key: string | null = null;

    if (hostnameParts.length > 3 && hostnameParts[1] === "s3" && hostnameParts[2] === "us-east-1") {
      bucket = hostnameParts[0]; // The bucket name is the first part of the hostname
    }

    // Extract key from the pathname
    key = parsedUrl.pathname.slice(1); // Remove the leading slash

    return { bucket, key };
  } catch (error) {
    console.error("Invalid URL format:", error);
    return { bucket: null, key: null };
  }
};
