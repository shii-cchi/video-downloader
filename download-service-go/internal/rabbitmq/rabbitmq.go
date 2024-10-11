package rabbitmq

import (
	"errors"
	"fmt"
	amqp "github.com/rabbitmq/amqp091-go"
)

type Rabbit struct {
	Conn       *amqp.Connection
	Ch         *amqp.Channel
	DeliveryCh <-chan amqp.Delivery
}

func InitRabbit(url string) (*Rabbit, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ %s\n", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, errors.New("failed to open a Ch")
	}

	deliveryCh, err := ch.Consume(
		"video_to_download_queue",
		"",
		true,
		false,
		false,
		false,
		nil,
	)

	return &Rabbit{
		Conn:       conn,
		Ch:         ch,
		DeliveryCh: deliveryCh,
	}, nil
}

func (r *Rabbit) Close() {
	r.Ch.Close()
	r.Conn.Close()
}
