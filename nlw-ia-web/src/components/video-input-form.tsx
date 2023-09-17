import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "./ui/separator";
import { FileVideo, Sparkles, SparklesIcon, Upload } from "lucide-react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { api } from "@/lib/axios";

type Status = "waiting" | "converting" | "uploading" | "generating" | "success";

const statusMessages = {
  converting: "Convertendo...",
  uploading: "Transcrevendo...",
  generating: "Carregando...",
  success: "Sucesso!",
};

interface VideoInputFormProps {
  onVideoUploaded: (id: string) => void;
}

export function VideoInputForm(props: VideoInputFormProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("waiting");

  const promptInputRef = useRef<HTMLTextAreaElement>(null);

   function handleRemoveVideo() {
    setVideoFile(null);
    setStatus("waiting");
    if (promptInputRef.current) {
      promptInputRef.current.value = "";
    }
  }

  function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const { files } = e.currentTarget;

    if (!files) {
      return;
    }

    const selectedFile = files[0];

    setVideoFile(selectedFile);
  }

  async function convertVideoToAudio(video: File) {
    console.log("Convert started.");

    const ffmpeg = await getFFmpeg();

    await ffmpeg.writeFile("input.mp4", await fetchFile(video));

    ffmpeg.on("progress", (progress) => {
      console.log("Convert progress: " + Math.round(progress.progress * 100));
    });

    await ffmpeg.exec(["-i", "input.mp4", "-map", "0:a", "-b:a", "20k", "-acodec", "libmp3lame", "output.mp3"]);

    const data = await ffmpeg.readFile("output.mp3");

    const audioFileBlob = new Blob([data], { type: "audio/mpeg" });
    const audioFile = new File([audioFileBlob], "audio.mp3", {
      type: "audio/mpeg",
    });

    console.log("Convert finished.");

    return audioFile;
  }

  async function handleUploadVideo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const prompt = promptInputRef.current?.value;

    if (!videoFile) {
      return;
    }

    setStatus("converting");

    const audioFile = await convertVideoToAudio(videoFile);

    const data = new FormData();
    data.append("file", audioFile);
    console.log(data);
    setStatus("uploading");
    const response = await api.post("/video/upload", data);
    const videoId = await response.data.video.id;

    setStatus("generating");

    await api
      .post(`ai/video/${videoId}/transcription`, {
        prompt,
        language: "pt",
      })
      .then((response) => {
        setStatus("success");
      })
      .catch((error) => {
        setStatus("waiting");
      });

    props.onVideoUploaded(videoId);
  }

  const previewURL = useMemo(() => {
    if (!videoFile) {
      return null;
    }

    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  return (
    <form onSubmit={handleUploadVideo} className="space-y-6">
      <label
        htmlFor="video"
        className="relative w-full flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground rounded-md border border-dashed aspect-video cursor-pointer hover:bg-primary-foreground transition-colors"
      >
        {previewURL ? (
          <div className="aspect-w-16 aspect-h-9 w-full">
            <video src={previewURL} controls={false} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
          </div>
        ) : (
          <>
            <FileVideo />
            Selecione um vídeo
          </>
        )}
      </label>

      <input type="file" id="video" accept="video/mp4" onChange={handleFileSelected} className="sr-only" />

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>
        <Textarea
          ref={promptInputRef}
          disabled={status !== "waiting"}
          id="transcription_prompt"
          placeholder="Inclua palavras-chave mencionadas no vídeo separadas por vírgula (,)"
          className="h-20 max-h-32 leading-relaxed"
        />
      </div>

      <Button
        data-success={status === "success"}
        type="submit"
        disabled={status !== "waiting"}
        className="w-full text-secondary bg-secondary-foreground hover:bg-secondary-foreground/90 data-[success=true]:bg-emerald-600"
      >
        {status === "waiting" ? (
          <>
            Carregar vídeo
            <Upload className="w-4 h-4 ml-2" />
          </>
        ) : (
          <div className="text-zinc-100 flex items-center">
            {status === "success" ? <Sparkles className="w-4 h-4 mr-2" /> : ""}
            {statusMessages[status]}
            {status === "success" ? <Sparkles className="w-4 h-4 ml-2" /> : ""}
          </div>
        )}
      </Button>
    </form>
  );
}
