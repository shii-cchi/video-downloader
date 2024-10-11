package video_download_service

import "download-service-go/internal/model"

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

func (v *VideoDownloadService) Download(params model.VideoDownloadParams) (model.VideoInfo, error) {
	return model.VideoInfo{}, nil
}
