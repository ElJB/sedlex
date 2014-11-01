import pika
import json

class RpcServer:
	def __init__(self, id, fn):
		self.id = id
		self.fn = fn
		self.connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost'))

		self.channel = connection.channel()

		channel.queue_declare(queue=id)

		channel.basic_qos(prefetch_count=1)
		channel.basic_consume(self.on_request, queue=id)

		channel.start_consuming()

	def on_request(self, ch, method, props, body):
	    body = JSON.loads(body)

	    response = self.fn(body)

	    ch.basic_publish(exchange='',
	                     routing_key=props.reply_to,
	                     properties=pika.BasicProperties(correlation_id = \
	                                                     props.correlation_id),
	                     body=json.dumps(response))
	    ch.basic_ack(delivery_tag = method.delivery_tag)


__all__ = ["RpcServer"]