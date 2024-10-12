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
	cfg, err := config.LoadConfig()
	if err != nil {
		log.WithError(err).Fatal("error loading config")
	}
	log.Println("successfully load config")

	rabbit, err := rabbitmq.InitRabbit(fmt.Sprintf("amqp://%s:%s@%s:%s/", cfg.RabbitMQDefaultUser, cfg.RabbitMQDefaultPass, cfg.RabbitMQHost, cfg.RabbitMQPort), cfg.ToDownloadQueue)
	if err != nil {
		log.WithError(err).Fatal("error init rabbitmq")
	}
	log.Info("successfully connection to rabbitmq")
	defer rabbit.Close()

	videoDownloadService := video_download_service.NewVideoDownloadService(preview_service.NewPreviewService())

	c := consumer.NewConsumer(cfg.DownloadedVideoQueue, rabbit.Ch, rabbit.DeliveryCh, videoDownloadService)
	c.ProcessMessage()
}
