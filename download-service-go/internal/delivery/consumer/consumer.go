package consumer

import (
	"download-service-go/internal/delivery/dto"
	"encoding/json"
	"fmt"
	amqp "github.com/rabbitmq/amqp091-go"
	log "github.com/sirupsen/logrus"
)

type Consumer struct {
	queueToPublish       string
	errorQueue           string
	ch                   *amqp.Channel
	deliveryCh           <-chan amqp.Delivery
	videoDownloadService VideoDownloadService
}

type VideoDownloadService interface {
	Download(downloadParams dto.VideoDownloadDto) (dto.VideoInfoDto, error)
}

func NewConsumer(queueToPublish string, errorQueue string, ch *amqp.Channel, deliveryCh <-chan amqp.Delivery, videoDownloadService VideoDownloadService) *Consumer {
	return &Consumer{
		queueToPublish:       queueToPublish,
		errorQueue:           errorQueue,
		ch:                   ch,
		deliveryCh:           deliveryCh,
		videoDownloadService: videoDownloadService,
	}
}

func (c Consumer) ProcessMessage() {
	log.Info("start consuming messages")

	for {
		downloadParams, err := c.getVideoDownloadParams()
		if err != nil {
			c.sendError(err)
			continue
		}

		videoInfo, err := c.videoDownloadService.Download(downloadParams)
		if err != nil {
			c.sendError(err)
			continue
		}

		if err := c.sendVideoInfo(videoInfo); err != nil {
			c.sendError(err)
		}
	}
}

func (c Consumer) getVideoDownloadParams() (dto.VideoDownloadDto, error) {
	delivery := <-c.deliveryCh
	log.Printf("received a message: %s\n", delivery.Body)

	var rabbitMessage dto.ReceivedMessageDto

	if err := json.Unmarshal(delivery.Body, &rabbitMessage); err != nil {
		log.WithError(err).Error("failed to unmarshal message: %s", delivery.Body)
		return dto.VideoDownloadDto{}, fmt.Errorf("failed to unmarshal message: (%s)", delivery.Body)
	}

	return dto.VideoDownloadDto{
		VideoURL: rabbitMessage.Data.VideoURL,
		Type:     rabbitMessage.Data.Type,
		Quality:  rabbitMessage.Data.Quality,
	}, nil
}

func (c Consumer) sendVideoInfo(videoInfo dto.VideoInfoDto) error {
	videoInfoMsg := dto.VideoInfoMessageDto{
		Pattern: c.queueToPublish,
		Data:    videoInfo,
	}

	msg, err := json.Marshal(videoInfoMsg)
	if err != nil {
		log.WithError(err).Error("error marshaling video info: %s", videoInfo)
		return fmt.Errorf("error marshaling video info: %s", videoInfo)
	}

	if err = c.ch.Publish(
		"",
		c.queueToPublish,
		false,
		false,
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        msg,
		}); err != nil {
		log.WithError(err).Error("error publishing video info: %s", msg)
		return fmt.Errorf("error publishing video info: %s", msg)
	}

	log.Printf("sent msg: %s\n into queue", string(msg))
	return nil
}

func (c Consumer) sendError(errToSend error) {
	errMsg := dto.ErrorMessageDto{
		Pattern: c.errorQueue,
		Data: dto.ErrorDto{
			Error: errToSend.Error(),
		},
	}

	msg, err := json.Marshal(errMsg)
	if err != nil {
		log.WithError(err).Error("error marshaling error: %s", err)
	}

	if err = c.ch.Publish(
		"",
		c.errorQueue,
		false,
		false,
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        msg,
		}); err != nil {
		log.WithError(err).Error("error publishing error: %s", msg)
	}

	log.Printf("sent msg: %s into queue", string(msg))
}
