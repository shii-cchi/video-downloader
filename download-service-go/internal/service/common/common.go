package common

import (
	crypto "crypto/rand"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
)

const (
	VideoDir = "videos"
)

func CreateRandomDir(commonDir string) (string, error) {
	randBytes, err := generateRandomBytes(2)
	if err != nil {
		return "", err
	}

	firstRandDir := fmt.Sprintf("%02x", randBytes[0])
	secondRandDir := fmt.Sprintf("%02x", randBytes[1])

	fullDirPath := filepath.Join(commonDir, firstRandDir, secondRandDir)
	err = os.MkdirAll(fullDirPath, os.ModePerm)
	if err != nil {
		return "", fmt.Errorf("error creating directory (dir path: %s): %s", fullDirPath, err)
	}

	return filepath.Join(firstRandDir, secondRandDir), nil
}

func generateRandomBytes(length int) ([]byte, error) {
	randBytes := make([]byte, length)
	_, err := crypto.Read(randBytes)
	if err != nil {
		return nil, fmt.Errorf("error generating random bytes: %s", err)
	}
	return randBytes, nil
}

func ReplaceSpecialSymbols(videoName string) string {
	re := regexp.MustCompile(`[\\/:*?"<>|]`)
	safeFileName := re.ReplaceAllString(videoName, "")

	return safeFileName
}

func CreateAndWriteFile(filePath string, data io.ReadCloser) error {
	file, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("error creating file (filepath: %s): %s", filePath, err)
	}
	defer file.Close()

	_, err = io.Copy(file, data)
	if err != nil {
		return fmt.Errorf("error saving data to file (filepath: %s): %s", filePath, err)
	}

	return nil
}
