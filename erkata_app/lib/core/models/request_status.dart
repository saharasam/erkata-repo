enum RequestStatus {
  pending('Pending'),
  assigned('Assigned'),
  fulfilled('Fulfilled'),
  disputed('Disputed'),
  completed('Completed');

  final String label;
  const RequestStatus(this.label);
}
