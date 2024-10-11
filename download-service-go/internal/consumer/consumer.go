package consumer

import (
	"download-service-go/internal/model"
	"encoding/json"
	amqp "github.com/rabbitmq/amqp091-go"
	log "github.com/sirupsen/logrus"
)

type Consumer struct {
	ch                   *amqp.Channel
	deliveryCh           <-chan amqp.Delivery
	videoDownloadService VideoDownloadService
}

type VideoDownloadService interface {
	Download(params model.VideoDownloadParams) (model.VideoInfo, error)
}

func NewConsumer(ch *amqp.Channel, deliveryCh <-chan amqp.Delivery, videoDownloadService VideoDownloadService) *Consumer {
	return &Consumer{
		ch:                   ch,
		deliveryCh:           deliveryCh,
		videoDownloadService: videoDownloadService,
	}
}

func (c Consumer) ProcessMessage() {
	log.Info("start consuming messages")

	for {
		params, err := c.GetVideoDownloadParams()
		if err != nil {
			continue
		}

		videoInfo, err := c.videoDownloadService.Download(params)
		if err != nil {
			continue
		}

		c.SendVideoInfo(videoInfo)
	}
}

func (c Consumer) GetVideoDownloadParams() (model.VideoDownloadParams, error) {
	delivery := <-c.deliveryCh
	log.Printf("received a message: %s\n", delivery.Body)

	var params model.VideoDownloadParams

	if err := json.Unmarshal(delivery.Body, &params); err != nil {
		log.WithError(err).Error("failed to unmarshal message: %s", delivery.Body)
		return model.VideoDownloadParams{}, err
	}

	return params, nil
}

func (c Consumer) SendVideoInfo(videoInfo model.VideoInfo) {
	msg, err := json.Marshal(videoInfo)
	if err != nil {
		log.WithError(err).Error("error marshaling video info: %s", videoInfo)
	}

	if err = c.ch.Publish(
		"",
		"downloaded_video_queue",
		false,
		false,
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        msg,
		}); err != nil {
		log.WithError(err).Error("error publishing video info: %s", msg)
	}

	log.Printf("sent msg: %s\n into queue", string(msg))
}
