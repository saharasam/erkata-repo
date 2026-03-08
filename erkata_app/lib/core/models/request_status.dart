enum RequestStatus {
  newRequest('New'),
  assigned('Assigned'),
  inProgress('In-Progress'),
  fulfilled('Fulfilled');

  final String label;
  const RequestStatus(this.label);
}
