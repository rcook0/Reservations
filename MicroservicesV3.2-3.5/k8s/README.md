# Kubernetes Manifests (V3.4)
Apply in order after pushing images to your registry:
kubectl apply -f k8s/booking.yaml
kubectl apply -f k8s/payment.yaml
kubectl apply -f k8s/notification.yaml
kubectl apply -f k8s/gateway.yaml

Note: These manifests assume Kafka and DBs are available in-cluster or via DNS.
