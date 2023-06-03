import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';

const socket = io.connect('http://localhost:4000');
function App() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');

  let peer;

  const initialCall = () => {
    peer = new SimplePeer({
      initiator: true,
      stream: localVideoRef.current.srcObject,
    });

    peer.on('signal', (offer) => {
      socket.emit('offer', offer);
    });

    peer.on('stream', (stream) => {
      remoteVideoRef.current.srcObject = stream;
    });
  };
  const toggleAudio = () => {
    const audioTracks = localVideoRef.current.srcObject.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsAudioMuted(!isAudioMuted);
  };
  const toggleVideo = () => {
    const videoTracks = localVideoRef.current.srcObject.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsVideoMuted(!isVideoMuted);
  };
  const handleAudioDeviceChange = (event) => {
    setSelectedAudioDevice(event.target.value);
    const constraints = {
      audio: { deviceId: { exact: event.target.value } },
      video: true,
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        peer.replaceTrack(
          stream.getAudioTracks()[0],
          localVideoRef.current.srcObject.getAudioTracks()[0],
          stream,
        );
      })
      .catch((error) => console.error(error));
  };

  const handleVideoDeviceChange = (event) => {
    setSelectedVideoDevice(event.target.value);
    const constraints = {
      audio: true,
      video: { deviceId: { exact: event.target.value } },
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        peer.replaceTrack(
          stream.getVideoTracks()[0],
          localVideoRef.current.srcObject.getVideoTracks()[0],
          stream,
        );
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((deviceList) => {
      const audioDevices = deviceList.filter(
        (device) => device.kind === 'audioinput',
      );
      const videoDevices = deviceList.filter(
        (device) => device.kind === 'videoinput',
      );
      setDevices({ audioDevices, videoDevices });
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;

        socket.on('offer', (offer) => {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          peer = new SimplePeer({ initiator: false, stream });
          peer.signal(offer);
        });

        socket.on('answer', (answer) => {
          peer.signal(answer);
        });

        socket.on('connect', () => {
          socket.emit('join');
        });

        peer?.on('stream', (stream) => {
          remoteVideoRef.current.srcObject = stream;
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div>
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        height={400}
        width={400}
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        height={400}
        width={400}
      />
      <div>
        <button onClick={initialCall}>Call</button>
        <button onClick={toggleAudio}>
          {isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
        </button>
        <button onClick={toggleVideo}>
          {isAudioMuted ? 'Unmute Video' : 'Mute Video'}
        </button>
        <select value={selectedAudioDevice} onChange={handleAudioDeviceChange}>
          {devices?.audioDevices?.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
        <select value={selectedVideoDevice} onChange={handleVideoDeviceChange}>
          {devices?.videoDevices?.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default App;
