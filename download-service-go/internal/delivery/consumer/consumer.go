package consumer

import (
	"download-service-go/internal/delivery/dto"
	"download-service-go/internal/rabbitmq"
	"encoding/json"
	"fmt"
	amqp "github.com/rabbitmq/amqp091-go"
	log "github.com/sirupsen/logrus"
)

type Consumer struct {
	rabbit               *rabbitmq.Rabbit
	videoDownloadService VideoDownloadService
}

type VideoDownloadService interface {
	Download(downloadParams dto.VideoDownloadDto) (dto.VideoInfoDto, error)
}

func NewConsumer(rabbit *rabbitmq.Rabbit, videoDownloadService VideoDownloadService) *Consumer {
	return &Consumer{
		rabbit:               rabbit,
		videoDownloadService: videoDownloadService,
	}
}

func (c Consumer) ProcessMessage() {
	log.Info("start consuming messages")

	for {
		downloadParams, delivery, err := c.getVideoDownloadParams()
		if err != nil {
			log.WithError(err).WithError(fmt.Errorf("error getting message with video download params"))
			c.sendError("error getting message with video download params")
			delivery.Ack(false)
			continue
		}

		videoInfo, err := c.videoDownloadService.Download(downloadParams)
		if err != nil {
			c.sendError(fmt.Sprintf("error downloading video %s", downloadParams.VideoURL))
			delivery.Ack(false)
			continue
		}

		if err := c.sendVideoInfo(videoInfo); err != nil {
			log.WithError(err).WithError(fmt.Errorf("error sending video info"))
			c.sendError("error sending video info")
			delivery.Ack(false)
			continue
		}

		delivery.Ack(false)
	}
}

func (c Consumer) getVideoDownloadParams() (dto.VideoDownloadDto, amqp.Delivery, error) {
	delivery := <-c.rabbit.DeliveryCh
	log.Debugf("received a message: %s\n", delivery.Body)

	var rabbitMessage dto.ReceivedMessageDto

	if err := json.Unmarshal(delivery.Body, &rabbitMessage); err != nil {
		return dto.VideoDownloadDto{}, amqp.Delivery{}, fmt.Errorf("failed to unmarshal message: (%s)", delivery.Body)
	}

	return dto.VideoDownloadDto{
		VideoURL: rabbitMessage.Data.VideoURL,
		Type:     rabbitMessage.Data.Type,
		Quality:  rabbitMessage.Data.Quality,
	}, delivery, nil
}

func (c Consumer) sendVideoInfo(videoInfo dto.VideoInfoDto) error {
	videoInfoMsg := dto.VideoInfoMessageDto{
		Pattern: c.rabbit.QueueToPublish,
		Data:    videoInfo,
	}

	msg, err := json.Marshal(videoInfoMsg)
	if err != nil {
		return fmt.Errorf("error marshaling video info: %s", videoInfo)
	}

	if err = c.rabbit.Ch.Publish(
		"",
		c.rabbit.QueueToPublish,
		false,
		false,
		amqp.Publishing{
			ContentType:  "text/plain",
			Body:         msg,
			DeliveryMode: amqp.Persistent,
		}); err != nil {
		return fmt.Errorf("error publishing video info: %s", msg)
	}

	log.Debugf("sent msg: %s\n into queue", string(msg))
	return nil
}

func (c Consumer) sendError(errToSend string) {
	errMsg := dto.ErrorMessageDto{
		Pattern: c.rabbit.ErrorQueue,
		Data: dto.ErrorDto{
			Error: errToSend,
		},
	}

	msg, err := json.Marshal(errMsg)
	if err != nil {
		log.WithError(err).Error("error marshaling error: %s", err)
		return
	}

	if err = c.rabbit.Ch.Publish(
		"",
		c.rabbit.ErrorQueue,
		false,
		false,
		amqp.Publishing{
			ContentType:  "text/plain",
			Body:         msg,
			DeliveryMode: amqp.Persistent,
		}); err != nil {
		log.WithError(err).Error("error publishing error: %s", msg)
		return
	}

	log.Debugf("sent msg: %s into queue", string(msg))
}
