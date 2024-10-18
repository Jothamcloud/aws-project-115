import React, { useState, useEffect } from 'react';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

const S3VideoPlayer = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const s3Client = new S3Client({
    region: import.meta.env.VITE_AWS_REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    },
  });

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const command = new ListObjectsV2Command({
          Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
        });
        const response = await s3Client.send(command);
        setVideos(response.Contents.filter(item => item.Key.endsWith('.mp4')));
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, []);

  const handleVideoSelect = async (video) => {
    try {
      const command = new GetObjectCommand({
        Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
        Key: video.Key,
      });
      const response = await s3Client.send(command);
      
      // Convert the ReadableStream to a Blob
      const blob = await new Response(response.Body).blob();
      const url = URL.createObjectURL(blob);
      setSelectedVideo(url);
    } catch (error) {
      console.error("Error fetching video:", error);
    }
  };

  return (
    <div className="s3-video-player">
      <h1>S3 Video Player</h1>
      <div className="video-container">
        <div className="video-list">
          <h2>Video List</h2>
          <ul>
            {videos.map((video, index) => (
              <li key={index} onClick={() => handleVideoSelect(video)}>
                {video.Key}
              </li>
            ))}
          </ul>
        </div>
        <div className="video-player">
          <h2>Video Player</h2>
          {selectedVideo ? (
            <video controls width="100%">
              <source src={selectedVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <p>Select a video to play</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default S3VideoPlayer;