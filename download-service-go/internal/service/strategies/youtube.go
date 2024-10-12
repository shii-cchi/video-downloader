package strategies

import (
	"download-service-go/internal/service/common"
	"fmt"
	"github.com/kkdai/youtube/v2"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

const videoFormat = ".mp4"

type YouTubeDownloadStrategy struct{}

func (s YouTubeDownloadStrategy) Download(videoURL string, quality string) (string, string, error) {
	videoID, err := s.getVideoID(videoURL)
	if err != nil {
		return "", "", err
	}

	video, err := s.fetchVideoMetadata(videoID)
	if err != nil {
		return "", "", err
	}

	videoName := common.ReplaceSpecialSymbols(video.Title)

	videoPath, audioPath, format, err := s.downloadAndPrepareFiles(video, quality, videoName)
	if err != nil {
		return "", "", err
	}

	defer func() {
		if derr := s.deleteTmpFiles(videoPath, audioPath); derr != nil {
			if err == nil {
				err = derr
			}
		}
	}()

	realPath, err := common.CreateRandomDir(common.VideoDir)
	if err != nil {
		return "", "", err
	}

	mergedFilePath := filepath.Join(common.VideoDir, realPath, fmt.Sprintf("%s %s%s", videoName, format.QualityLabel, videoFormat))
	if err := s.mergeVideoAudio(videoPath, audioPath, mergedFilePath); err != nil {
		return "", "", err
	}

	return fmt.Sprintf("%s %s", video.Title, format.QualityLabel), filepath.Join(realPath, fmt.Sprintf("%s %s%s", videoName, format.QualityLabel, videoFormat)), err
}

func (s YouTubeDownloadStrategy) getVideoID(videoURL string) (string, error) {
	parsedURL, err := url.Parse(videoURL)
	if err != nil {
		return "", fmt.Errorf("failed to parse VideoURL (video url: %s): %s", videoURL, err)
	}

	queryParams := parsedURL.Query()
	videoID := queryParams.Get("v")
	if videoID == "" {
		return "", fmt.Errorf("videoID not found in url (video url: %s): %s", videoURL, err)
	}

	return videoID, nil
}

func (s YouTubeDownloadStrategy) fetchVideoMetadata(videoID string) (*youtube.Video, error) {
	client := youtube.Client{}
	video, err := client.GetVideo(videoID)
	if err != nil {
		return nil, fmt.Errorf("error fetching video metadata (video id: %s): %s", videoID, err)
	}

	return video, nil
}

func (s YouTubeDownloadStrategy) downloadAndPrepareFiles(video *youtube.Video, quality string, videoName string) (string, string, *youtube.Format, error) {
	selectedVideoFormat := s.selectVideoFormat(video, quality)
	videoPath := filepath.Join(common.VideoDir, fmt.Sprintf("%s_video_%s%s", videoName, selectedVideoFormat.QualityLabel, videoFormat))
	if err := s.downloadStreamToFile(video, selectedVideoFormat, videoPath); err != nil {
		return "", "", nil, err
	}

	selectedAudioFormat := s.selectAudioFormat(video)
	audioPath := filepath.Join(common.VideoDir, fmt.Sprintf("%s_audio%s", videoName, videoFormat))
	if err := s.downloadStreamToFile(video, selectedAudioFormat, audioPath); err != nil {
		return "", "", nil, err
	}

	return videoPath, audioPath, selectedVideoFormat, nil
}

func (s YouTubeDownloadStrategy) selectVideoFormat(video *youtube.Video, quality string) *youtube.Format {
	formats := video.Formats.Type("video")
	for _, format := range formats {
		if quality == "best" || format.QualityLabel == quality {
			return &format
		}
	}

	return &formats[0]
}

func (s YouTubeDownloadStrategy) selectAudioFormat(video *youtube.Video) *youtube.Format {
	formats := video.Formats.Type("audio")
	for _, format := range formats {
		if strings.Contains(format.MimeType, "audio/mp4") {
			return &format
		}
	}

	return &formats[0]
}

func (s YouTubeDownloadStrategy) downloadStreamToFile(video *youtube.Video, format *youtube.Format, fileName string) error {
	client := youtube.Client{}

	stream, _, err := client.GetStream(video, format)
	if err != nil {
		return fmt.Errorf("error getting stream (for file: %s): %s", fileName, err)
	}
	defer stream.Close()

	if err := common.CreateAndWriteFile(fileName, stream); err != nil {
		return err
	}

	return nil
}

func (s YouTubeDownloadStrategy) deleteTmpFiles(videoPath, audioPath string) error {
	var errMsg string

	if err := os.Remove(videoPath); err != nil {
		errMsg += fmt.Sprintf("%s - %s", videoPath, err)
	}

	if err := os.Remove(audioPath); err != nil {
		errMsg += fmt.Sprintf("%s - %s", audioPath, err)
	}

	if errMsg != "" {
		return fmt.Errorf("error geleting tmp files: %s", errMsg)
	}

	return nil
}

func (s YouTubeDownloadStrategy) mergeVideoAudio(videoFileName string, audioFileName string, mergedFileName string) error {
	cmd := exec.Command("ffmpeg", "-i", videoFileName, "-i", audioFileName, "-c", "copy", mergedFileName)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("error merging video and audio (to file: %s): %s", mergedFileName, err)
	}

	return nil
}
