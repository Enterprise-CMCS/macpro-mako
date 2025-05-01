import { API } from "aws-amplify";

export const getPresignedUrl = async (fileName: string): Promise<string> => {
  const response = await API.post("os", "/getUploadUrl", {
    body: { fileName },
  });
  if (response.url) {
    return response.url;
  }
  throw new Error(response);
};

export const uploadToS3 = async (file: File, url: string): Promise<void> => {
  const response = await fetch(url, {
    body: file,
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error();
  }
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
    throw new Error("Invalid URL format:", error);
  }
};
