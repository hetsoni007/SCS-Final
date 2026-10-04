import { ogContentType, ogImage, ogSize } from "@/lib/og";
export const alt = "Soni Consultancy Services — Build iOS & Android MVPs from 8 weeks";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static"; // required for the static export
export default function Image() { return ogImage("Build iOS & Android MVPs from 8 weeks."); }
