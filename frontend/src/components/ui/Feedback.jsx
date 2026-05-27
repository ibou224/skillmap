import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function Feedback({ type, message }) {
    if (!message) return null;
    const isError = type === "error";
    return (
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
        ${isError ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
        {isError
          ? <AlertCircle className="w-4 h-4 shrink-0" />
          : <CheckCircle2 className="w-4 h-4 shrink-0" />}
        {message}
      </div>
    );
  }