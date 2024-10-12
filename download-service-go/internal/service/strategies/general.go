package strategies

import (
	"download-service-go/internal/service/common"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
)

type GeneralDownloadStrategy struct{}

func (s GeneralDownloadStrategy) Download(videoURL string, quality string) (string, string, error) {
	res, err := http.Get(videoURL)
	if err != nil {
		return "", "", fmt.Errorf("error sending get request for downloading video from general player (video url: %s): %s", videoURL, err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return "", "", fmt.Errorf("error failed to download video from general player (video url: %s, status code: %d)", videoURL, res.StatusCode)
	}

	realPath, err := common.CreateRandomDir(common.VideoDir)
	if err != nil {
		return "", "", err
	}

	videoName := common.ReplaceSpecialSymbols(filepath.Base(videoURL))
	filePath := filepath.Join(common.VideoDir, realPath, videoName)

	if err := common.CreateAndWriteFile(filePath, res.Body); err != nil {
		return "", "", err
	}

	return strings.TrimSuffix(filepath.Base(videoURL), filepath.Ext(videoName)), filepath.Join(realPath, videoName), nil
}
