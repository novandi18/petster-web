import { ImgBBResponse } from "@/types/interfaces/ImgBBResponse";
import { Response } from "@/types/interfaces/Response";
import axios, { AxiosError } from "axios";
import FormData from "form-data";

export async function uploadPetImage(
  imageBase64: string,
  apiKey: string,
): Promise<Response<ImgBBResponse>> {
  try {
    const form = new FormData();
    const timestamp = Date.now().toString();
    const rawBase64 = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;
    form.append("image", rawBase64);
    form.append("name", timestamp);

    const url = "https://api.imgbb.com/1/upload";
    const { data } = await axios.post<{
      data: ImgBBResponse;
      success: boolean;
      status: number;
    }>(url, form, {
      params: { key: apiKey },
      headers: form.getHeaders(),
    });

    if (data.success) {
      return Response.Success(data.data);
    } else {
      console.error("ImgBB upload failed, status:", data.status);
      return Response.Error("Upload failed", data.data);
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError;
      let message: string;
      const responseData = axiosErr.response?.data;
      if (
        typeof responseData === "object" &&
        responseData !== null &&
        "error" in responseData &&
        typeof (responseData as { error: { message?: unknown } }).error
          .message === "string"
      ) {
        message = (responseData as { error: { message: string } }).error
          .message;
      } else {
        message = axiosErr.message;
      }
      console.error("Axios error uploading to ImgBB:", message);
      return Response.Error(message);
    }
    console.error("Unknown error uploading to ImgBB:", err);
    return Response.Error((err as Error).message);
  }
}
