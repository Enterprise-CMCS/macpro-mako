import axios from "axios";

export const instance = axios.create({
  baseURL: "https://4yjz2ueo3h.execute-api.us-east-1.amazonaws.com/add-api",
});
