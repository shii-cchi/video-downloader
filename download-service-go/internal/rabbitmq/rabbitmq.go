package rabbitmq

import (
	"fmt"
	amqp "github.com/rabbitmq/amqp091-go"
)

type Rabbit struct {
	QueueToPublish string
	ErrorQueue     string
	Conn           *amqp.Connection
	Ch             *amqp.Channel
	DeliveryCh     <-chan amqp.Delivery
}

func InitRabbit(url string, queueToConsume string, queueToPublish string, errorQueue string) (*Rabbit, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %s", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, fmt.Errorf("failed to open a channel: %s", err)
	}

	err = ch.Qos(1, 0, false)
	if err != nil {
		return nil, fmt.Errorf("failed to set QoS to channel: %s", err)
	}

	deliveryCh, err := ch.Consume(
		queueToConsume,
		"",
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get delivery channel: %s", err)
	}

	closeCh := make(chan *amqp.Error)
	conn.NotifyClose(closeCh)

	return &Rabbit{
		QueueToPublish: queueToPublish,
		ErrorQueue:     errorQueue,
		Conn:           conn,
		Ch:             ch,
		DeliveryCh:     deliveryCh,
	}, nil
}

func (r *Rabbit) Close() {
	r.Ch.Close()
	r.Conn.Close()
}
