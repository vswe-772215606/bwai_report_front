import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getUploads } from "../api/uploads";
import { UploadList } from "../components/upload/UploadList";
import { Button } from "../components/ui/button";
import { Loader2, Upload } from "lucide-react";

export function UploadsListPage() {
  const { data: uploads = [], isLoading } = useQuery({
    queryKey: ["uploads"],
    queryFn: getUploads,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Uploads</h1>
          <p className="text-sm text-gray-500">All uploaded Excel files.</p>
        </div>
        <Button asChild>
          <Link to="/uploads/new">
            <Upload className="h-4 w-4 mr-2" />
            Upload Excel
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-400 py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading uploads...
        </div>
      ) : (
        <UploadList uploads={uploads} />
      )}
    </div>
  );
}
