import { DownloadCloudIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/devere-ui/button";

function ButtonDemo() {
  const [loading, setLoading] = useState(false);
  const [iconLoading, setIconLoading] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        loading={loading}
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 2000);
        }}
      >
        Save changes
      </Button>
      <Button loading variant="outline">
        Loading
      </Button>
      <Button
        loading={iconLoading}
        onClick={() => {
          setIconLoading(true);
          setTimeout(() => setIconLoading(false), 2000);
        }}
        size="icon"
      >
        <DownloadCloudIcon />
      </Button>
      <Button loading size="icon" variant="outline">
        <DownloadCloudIcon />
      </Button>
    </div>
  );
}

export { ButtonDemo };
