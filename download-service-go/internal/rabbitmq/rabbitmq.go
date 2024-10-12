package rabbitmq

import (
	"fmt"
	amqp "github.com/rabbitmq/amqp091-go"
)

type Rabbit struct {
	Conn       *amqp.Connection
	Ch         *amqp.Channel
	DeliveryCh <-chan amqp.Delivery
}

func InitRabbit(url string, queueToConsume string) (*Rabbit, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %s", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, fmt.Errorf("failed to open a channel: %s", err)
	}

	deliveryCh, err := ch.Consume(
		queueToConsume,
		"",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get delivery channel: %s", err)
	}

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
