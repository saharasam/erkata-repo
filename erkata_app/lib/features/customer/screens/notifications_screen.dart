import 'package:flutter/material.dart';
import '../../../shared/widgets/erkata_screen_header.dart';

class _NotificationItem {
  final String id;
  final String type; // 'info', 'warning', 'success', 'alert'
  final String title;
  final String message;
  final String time;
  bool read;

  _NotificationItem({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.time,
    this.read = false,
  });
}

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final List<_NotificationItem> _notifications = [
    _NotificationItem(
      id: '1',
      type: 'success',
      title: 'Request Assigned',
      message:
          'Your request REQ-2024-001 has been assigned to a verified local agent.',
      time: '5m ago',
    ),
    _NotificationItem(
      id: '2',
      type: 'info',
      title: 'Agent Update',
      message:
          'Your agent has started working on your document retrieval request.',
      time: '30m ago',
    ),
    _NotificationItem(
      id: '3',
      type: 'alert',
      title: 'Payment Required',
      message:
          'Please complete the payment for request REQ-2024-003 to proceed.',
      time: '2h ago',
    ),
    _NotificationItem(
      id: '4',
      type: 'success',
      title: 'Request Completed',
      message:
          'Your passport renewal queue service has been completed successfully.',
      time: '1d ago',
      read: true,
    ),
    _NotificationItem(
      id: '5',
      type: 'warning',
      title: 'Feedback Pending',
      message:
          'Please submit your feedback for the completed transaction TXN-2024-099.',
      time: '2d ago',
      read: true,
    ),
    _NotificationItem(
      id: '6',
      type: 'info',
      title: 'System Update',
      message:
          'Erkata will undergo scheduled maintenance tonight from 2:00 AM – 4:00 AM.',
      time: '3d ago',
      read: true,
    ),
  ];

  void _markAllRead() {
    setState(() {
      for (final n in _notifications) {
        n.read = true;
      }
    });
  }

  IconData _getIcon(String type) {
    switch (type) {
      case 'success':
        return Icons.check_circle;
      case 'warning':
        return Icons.warning_amber_rounded;
      case 'alert':
        return Icons.error_outline;
      default:
        return Icons.info_outline;
    }
  }

  Color _getIconColor(String type, BuildContext context) {
    switch (type) {
      case 'success':
        return Colors.green;
      case 'warning':
        return Colors.amber[700]!;
      case 'alert':
        return Colors.red;
      default:
        return Theme.of(context).colorScheme.primary;
    }
  }

  Color _getIconBgColor(String type, BuildContext context) {
    return _getIconColor(type, context).withValues(alpha: 0.15);
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => !n.read).length;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            ErkataScreenHeader(
              title: 'Notifications',
              subtitle: 'Latest updates and alerts',
              customAction: unreadCount > 0
                  ? TextButton(
                      onPressed: _markAllRead,
                      child: Text(
                        'Mark all read',
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    )
                  : null,
            ),
            Expanded(
              child: _notifications.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.notifications_off_outlined,
                            size: 64,
                            color: Theme.of(context)
                                .colorScheme
                                .onSurfaceVariant
                                .withValues(alpha: 0.5),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'No notifications',
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.onSurface,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            "You're all caught up!",
                            style: TextStyle(
                              color: Theme.of(
                                context,
                              ).colorScheme.onSurfaceVariant,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: _notifications.length,
                      separatorBuilder: (_, __) => Divider(
                        height: 1,
                        indent: 76,
                        color: Theme.of(context).colorScheme.outlineVariant,
                      ),
                      itemBuilder: (context, index) {
                        final notification = _notifications[index];
                        return Container(
                          color: notification.read
                              ? Colors.transparent
                              : Theme.of(context).colorScheme.primaryContainer
                                    .withValues(alpha: 0.2),
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 8,
                            ),
                            leading: Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: _getIconBgColor(
                                  notification.type,
                                  context,
                                ),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Icon(
                                _getIcon(notification.type),
                                color: _getIconColor(
                                  notification.type,
                                  context,
                                ),
                                size: 22,
                              ),
                            ),
                            title: Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    notification.title,
                                    style: TextStyle(
                                      fontWeight: notification.read
                                          ? FontWeight.w500
                                          : FontWeight.bold,
                                      fontSize: 14,
                                      color: Theme.of(
                                        context,
                                      ).colorScheme.onSurface,
                                    ),
                                  ),
                                ),
                                if (!notification.read)
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: BoxDecoration(
                                      color: Theme.of(
                                        context,
                                      ).colorScheme.primary,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                              ],
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 4),
                                Text(
                                  notification.message,
                                  style: TextStyle(
                                    color: Theme.of(
                                      context,
                                    ).colorScheme.onSurfaceVariant,
                                    fontSize: 13,
                                    height: 1.4,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  notification.time,
                                  style: TextStyle(
                                    color: Theme.of(
                                      context,
                                    ).colorScheme.onSurfaceVariant,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                            onTap: () {
                              setState(() => notification.read = true);
                            },
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
