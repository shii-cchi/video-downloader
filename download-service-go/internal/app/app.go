package app

import (
	"download-service-go/internal/config"
	"download-service-go/internal/delivery/consumer"
	"download-service-go/internal/rabbitmq"
	"download-service-go/internal/service/preview_service"
	"download-service-go/internal/service/video_download_service"
	"fmt"
	log "github.com/sirupsen/logrus"
)

func Run() {
	log.SetLevel(log.DebugLevel)

	cfg, err := config.LoadConfig()
	if err != nil {
		log.WithError(err).Fatal("error loading config")
	}
	log.Println("successfully load config")

	rabbitURL := fmt.Sprintf("amqp://%s:%s@%s:%s/", cfg.RabbitMQDefaultUser, cfg.RabbitMQDefaultPass, cfg.RabbitMQHost, cfg.RabbitMQPort)
	rabbit, err := rabbitmq.InitRabbit(rabbitURL, cfg.ToDownloadQueue, cfg.DownloadedVideoQueue, cfg.ErrorQueue)
	if err != nil {
		log.WithError(err).Fatal("error init rabbitmq")
	}
	log.Info("successfully connection to rabbitmq")
	defer rabbit.Close()

	videoDownloadService := video_download_service.NewVideoDownloadService(preview_service.NewPreviewService())

	c := consumer.NewConsumer(rabbit, videoDownloadService)

	c.ProcessMessage()
}
