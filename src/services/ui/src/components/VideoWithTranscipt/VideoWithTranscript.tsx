import React, { useState } from "react";

export const VideoContent: React.FC<{
  src: string;
  title?: string;
  introText?: string;
  transcript?: JSX.Element;
}> = ({ title, introText, src, transcript }) => {
  const [showTranscript, setShowTranscript] = useState(false);

  const onClick = () => setShowTranscript(!showTranscript);

  return (
    <div className="video">
      <h4>{title}</h4>
      <p>{introText}</p>
      <video width="100%" controls>
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {transcript && (
        <>
          <button onClick={onClick}>
            {!showTranscript ? "Show Transcript" : "Hide Transcript"}
          </button>
          {showTranscript && (
            <div>
              <br />
              {transcript}
            </div>
          )}
        </>
      )}
    </div>
  );
};
