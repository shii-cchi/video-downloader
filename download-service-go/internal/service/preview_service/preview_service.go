package preview_service

import (
	"download-service-go/internal/service/common"
	"fmt"
	"math/rand"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

const (
	commonPreviewDir = "previews"
	previewFormat    = ".jpeg"

	minTimeFraction = 0.1
	maxTimeFraction = 0.8
)

type PreviewService struct {
}

func NewPreviewService() *PreviewService {
	return &PreviewService{}
}

func (p *PreviewService) CreatePreview(videoName string, realPath string) (string, error) {
	previewDir, err := common.CreateRandomDir(commonPreviewDir)
	if err != nil {
		return "", err
	}

	videoPath := filepath.Join(common.VideoDir, realPath)
	videoName = common.ReplaceSpecialSymbols(videoName)
	previewPath := filepath.Join(commonPreviewDir, previewDir, videoName+previewFormat)

	videoDuration, err := p.getVideoDuration(videoPath)
	if err != nil {
		return "", err
	}

	previewTime := p.generateRandomTime(videoDuration)

	if err := p.generatePreview(videoPath, previewPath, previewTime); err != nil {
		return "", err
	}

	return filepath.Join(previewDir, videoName+previewFormat), nil
}

func (p *PreviewService) getVideoDuration(videoPath string) (time.Duration, error) {
	cmd := exec.Command("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", videoPath)
	output, err := cmd.Output()
	if err != nil {
		return 0, fmt.Errorf("error getting video duration (video path: %s): %s", videoPath, err)
	}

	durationSeconds, err := strconv.ParseFloat(strings.TrimSpace(string(output)), 64)
	if err != nil {
		return 0, fmt.Errorf("error parsing video duration (video path: %s): %s", videoPath, err)
	}

	return time.Duration(durationSeconds) * time.Second, nil
}

func (p *PreviewService) generateRandomTime(videoDuration time.Duration) string {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	randomFraction := minTimeFraction + rng.Float64()*maxTimeFraction
	randomSeconds := int64(videoDuration.Seconds() * randomFraction)
	randomTime := time.Duration(randomSeconds) * time.Second
	return fmt.Sprintf("%d", int(randomTime.Seconds()))
}

func (p *PreviewService) generatePreview(videoPath, previewPath, previewTime string) error {
	cmd := exec.Command("ffmpeg", "-i", videoPath, "-ss", previewTime, "-vframes", "1", previewPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("error generating preview (ffmpeg output: %s): %s", string(output), err)
	}

	return nil
}
