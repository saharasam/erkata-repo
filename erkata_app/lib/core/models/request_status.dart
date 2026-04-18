enum RequestStatus {
  pending('Pending'),
  assigned('Assigned'),
  fulfilled('Fulfilled'),
  disputed('Disputed');

  final String label;
  const RequestStatus(this.label);
}
