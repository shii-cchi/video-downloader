package video_download_service

import (
	"download-service-go/internal/delivery/dto"
	"download-service-go/internal/service/strategies"
)

const youTubeVideoType = "youtube"

type Preview interface {
	CreatePreview(videoName string, realPath string) (string, error)
}

type VideoDownloadStrategy interface {
	Download(videoURL string, quality string) (string, string, error)
}

type VideoDownloadService struct {
	previewService Preview
	strategy       VideoDownloadStrategy
}

func NewVideoDownloadService(previewService Preview) *VideoDownloadService {
	return &VideoDownloadService{
		previewService: previewService,
	}
}

func (v *VideoDownloadService) setVideoDownloadStrategy(strategy VideoDownloadStrategy) {
	v.strategy = strategy
}

func (v *VideoDownloadService) Download(downloadParams dto.VideoDownloadDto) (dto.VideoInfoDto, error) {
	switch downloadParams.Type {
	case youTubeVideoType:
		v.setVideoDownloadStrategy(strategies.YouTubeDownloadStrategy{})
	default:
		v.setVideoDownloadStrategy(strategies.GeneralDownloadStrategy{})
	}

	videoName, realPath, err := v.strategy.Download(downloadParams.VideoURL, downloadParams.Quality)
	if err != nil {
		return dto.VideoInfoDto{}, err
	}

	previewPath, err := v.previewService.CreatePreview(videoName, realPath)
	if err != nil {
		return dto.VideoInfoDto{}, err
	}

	return dto.VideoInfoDto{
		VideoName:   videoName,
		RealPath:    realPath,
		PreviewPath: previewPath,
	}, nil
}
