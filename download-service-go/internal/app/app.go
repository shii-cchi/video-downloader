package app

import (
	"download-service-go/internal/consumer"
	"download-service-go/internal/rabbitmq"
	"download-service-go/internal/service/preview_service"
	"download-service-go/internal/service/video_download_service"
	log "github.com/sirupsen/logrus"
)

func Run() {
	rabbit, err := rabbitmq.InitRabbit("amqp://guest:guest@localhost:5672/")
	if err != nil {
		log.Fatalf("error init rabbitmq: %s\n", err)
	}
	log.Info("successfully connection to rabbitmq")
	defer rabbit.Close()

	videoDownloadService := video_download_service.NewVideoDownloadService(preview_service.NewPreviewService())

	c := consumer.NewConsumer(rabbit.Ch, rabbit.DeliveryCh, videoDownloadService)
	c.ProcessMessage()
}