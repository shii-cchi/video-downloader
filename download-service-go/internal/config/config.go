package config

import (
	"errors"
	"github.com/joho/godotenv"
	"os"
)

type Config struct {
	RabbitMQDefaultUser  string
	RabbitMQDefaultPass  string
	RabbitMQHost         string
	RabbitMQPort         string
	ToDownloadQueue      string
	DownloadedVideoQueue string
	ErrorQueue           string
}

func LoadConfig() (*Config, error) {
	err := godotenv.Load(".env")
	if err != nil {
		return nil, err
	}

	rabbitMQDefaultUser := os.Getenv("RABBITMQ_DEFAULT_USER")
	if rabbitMQDefaultUser == "" {
		return nil, errors.New("RABBITMQ_DEFAULT_USER parameter is not defined")
	}

	rabbitMQDefaultPass := os.Getenv("RABBITMQ_DEFAULT_PASS")
	if rabbitMQDefaultPass == "" {
		return nil, errors.New("RABBITMQ_DEFAULT_PASS parameter is not defined")
	}

	rabbitMQHost := os.Getenv("RABBITMQ_HOST")
	if rabbitMQHost == "" {
		return nil, errors.New("RABBITMQ_HOST parameter is not defined")
	}

	rabbitMQPort := os.Getenv("RABBITMQ_PORT")
	if rabbitMQPort == "" {
		return nil, errors.New("RABBITMQ_PORT parameter is not defined")
	}

	toDownloadQueue := os.Getenv("TO_DOWNLOAD_QUEUE")
	if toDownloadQueue == "" {
		return nil, errors.New("TO_DOWNLOAD_QUEUE parameter is not defined")
	}

	downloadedVideoQueue := os.Getenv("DOWNLOADED_VIDEO_QUEUE")
	if downloadedVideoQueue == "" {
		return nil, errors.New("DOWNLOADED_VIDEO_QUEUE parameter is not defined")
	}

	errorQueue := os.Getenv("ERROR_QUEUE")
	if errorQueue == "" {
		return nil, errors.New("ERROR_QUEUE parameter is not defined")
	}

	return &Config{
		RabbitMQDefaultUser:  rabbitMQDefaultUser,
		RabbitMQDefaultPass:  rabbitMQDefaultPass,
		RabbitMQHost:         rabbitMQHost,
		RabbitMQPort:         rabbitMQPort,
		ToDownloadQueue:      toDownloadQueue,
		DownloadedVideoQueue: downloadedVideoQueue,
		ErrorQueue:           errorQueue,
	}, nil
}
