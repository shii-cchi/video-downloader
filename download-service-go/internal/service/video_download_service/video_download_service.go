package video_download_service

import (
	"download-service-go/internal/delivery/dto"
)

type Preview interface {
}

type VideoDownloadStrategy interface {
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

func (v *VideoDownloadService) Download(params dto.VideoDownloadDto) (dto.VideoInfoDto, error) {
	return dto.VideoInfoDto{}, nil
}
