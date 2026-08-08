import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class SmartTripAIChat extends StatefulWidget {
  const SmartTripAIChat({super.key});

  @override
  State<SmartTripAIChat> createState() => _SmartTripAIChatState();
}

class _SmartTripAIChatState extends State<SmartTripAIChat> {
  bool _isOpen = false;
  final TextEditingController _controller = TextEditingController();
  final List<Map<String, dynamic>> _messages = [
    {
      'sender': 'AI',
      'text': 'Hello! I am your SmartTrip AI assistant. Ask me anything about your trip telemetry, fuel friction waste, safety scores, or pit stops.',
    }
  ];
  bool _isLoading = false;

  final List<String> _quickPrompts = [
    'How much money did I waste in traffic this week?',
    'What was my lowest eco score?',
    'Show all pit stops',
    'How many hard brakes did I have?',
  ];

  void _handleSend([String? query]) {
    final q = query ?? _controller.text;
    if (q.trim().isEmpty) return;

    setState(() {
      _messages.add({'sender': 'USER', 'text': q});
      if (query == null) _controller.clear();
      _isLoading = true;
    });

    // Simulate AI response
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _messages.add({
            'sender': 'AI',
            'text': 'This is a simulated AI response indicating that SQLite Natural Language querying is working on-device.',
            'sql': 'SELECT * FROM trips WHERE idle_cost > 0;',
          });
          _isLoading = false;
        });
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isOpen) {
      return Positioned(
        bottom: 24,
        right: 24,
        child: FloatingActionButton.extended(
          onPressed: () => setState(() => _isOpen = true),
          backgroundColor: const Color(0xFF00B8D4),
          icon: const Icon(LucideIcons.sparkles, size: 20, color: Colors.white),
          label: const Text('SMART TRIP AI CHAT', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace', color: Colors.white)),
        ),
      );
    }

    return Positioned(
      bottom: 24,
      right: 24,
      width: 360,
      height: 540,
      child: Material(
        color: Colors.transparent,
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFF0B1117).withOpacity(0.95),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF00B8D4).withOpacity(0.5)),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.5), blurRadius: 20)
            ],
          ),
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(12),
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: Color(0xFF1F2A37))),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: const Color(0xFF00B8D4).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(LucideIcons.bot, size: 16, color: Color(0xFF00B8D4)),
                        ),
                        const SizedBox(width: 8),
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('SMART TRIP AI ASSISTANT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, fontFamily: 'monospace', color: Colors.white)),
                            Text('ON-DEVICE SQL QUERY ENGINE', style: TextStyle(fontSize: 8, fontFamily: 'monospace', color: Color(0xFF00E676))),
                          ],
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(LucideIcons.x, size: 16, color: Color(0xFF9FB3C8)),
                      onPressed: () => setState(() => _isOpen = false),
                      constraints: const BoxConstraints(),
                      padding: EdgeInsets.zero,
                    ),
                  ],
                ),
              ),

              // Messages Area
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) {
                    final msg = _messages[index];
                    final isUser = msg['sender'] == 'USER';
                    return Align(
                      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
                        constraints: const BoxConstraints(maxWidth: 280),
                        decoration: BoxDecoration(
                          color: isUser ? const Color(0xFF00B8D4).withOpacity(0.2) : const Color(0xFF16212B),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: isUser ? const Color(0xFF00B8D4).withOpacity(0.4) : const Color(0xFF1F2A37)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(isUser ? LucideIcons.user : LucideIcons.bot, size: 10, color: isUser ? const Color(0xFF00B8D4) : const Color(0xFF00E676)),
                                const SizedBox(width: 4),
                                Text(isUser ? 'YOU' : 'AI TELEMATICS ENGINE', style: const TextStyle(fontSize: 8, fontFamily: 'monospace', color: Color(0xFF9FB3C8))),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(msg['text'], style: TextStyle(fontSize: 10, fontFamily: 'monospace', color: isUser ? Colors.white : const Color(0xFFE6F1FF))),
                            if (msg['sql'] != null) ...[
                              const SizedBox(height: 8),
                              const Divider(color: Color(0xFF1F2A37)),
                              Row(
                                children: [
                                  const Icon(LucideIcons.code2, size: 10, color: Color(0xFF00B8D4)),
                                  const SizedBox(width: 4),
                                  const Text('VIEW GENERATED SQL', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, fontFamily: 'monospace', color: Color(0xFF00B8D4))),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0B1117),
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: const Color(0xFF1F2A37)),
                                ),
                                child: Text(msg['sql'], style: const TextStyle(fontSize: 8, fontFamily: 'monospace', color: Color(0xFFFFC107))),
                              ),
                            ]
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              if (_isLoading)
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      const Icon(LucideIcons.sparkles, size: 12, color: Color(0xFF00B8D4)),
                      const SizedBox(width: 8),
                      const Text('Translating natural query into SQLite execution...', style: TextStyle(fontSize: 9, fontFamily: 'monospace', color: Color(0xFF9FB3C8))),
                    ],
                  ),
                ),

              // Quick Prompts
              Container(
                height: 40,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: const BoxDecoration(
                  color: Color(0xFF16212B),
                  border: Border(top: BorderSide(color: Color(0xFF1F2A37))),
                ),
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _quickPrompts.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    return Center(
                      child: InkWell(
                        onTap: () => _handleSend(_quickPrompts[index]),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0B1117),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFF1F2A37)),
                          ),
                          child: Text(_quickPrompts[index], style: const TextStyle(fontSize: 8, fontFamily: 'monospace', color: Color(0xFF9FB3C8))),
                        ),
                      ),
                    );
                  },
                ),
              ),

              // Input
              Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: Color(0xFF16212B),
                  border: Border(top: BorderSide(color: Color(0xFF1F2A37))),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0B1117),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF1F2A37)),
                        ),
                        child: TextField(
                          controller: _controller,
                          style: const TextStyle(fontSize: 10, fontFamily: 'monospace', color: Colors.white),
                          decoration: const InputDecoration(
                            hintText: "Ask trip AI (e.g. 'Show fuel cost wasted')...",
                            hintStyle: TextStyle(fontSize: 10, fontFamily: 'monospace', color: Color(0xFF9FB3C8)),
                            border: InputBorder.none,
                          ),
                          onSubmitted: (val) => _handleSend(),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    InkWell(
                      onTap: _isLoading ? null : () => _handleSend(),
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: _isLoading ? const Color(0xFF00B8D4).withOpacity(0.5) : const Color(0xFF00B8D4),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(LucideIcons.cornerDownLeft, size: 16, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
