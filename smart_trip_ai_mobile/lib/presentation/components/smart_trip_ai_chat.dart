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
      return Positioned(
        bottom: 24,
        right: 24,
        child: FloatingActionButton.extended(
          onPressed: () => setState(() => _isOpen = true),
          backgroundColor: Colors.white,
          icon: const Icon(LucideIcons.sparkles, size: 20, color: Colors.black),
          label: const Text('SMART TRIP AI CHAT', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black)),
        ),
      );

    return Positioned(
      bottom: 24,
      right: 24,
      width: 360,
      height: 540,
      child: Material(
        color: Colors.transparent,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.95),
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: const Color(0xFF333333)),
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
                  border: Border(bottom: BorderSide(color: Color(0xFF333333))),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: const Color(0xFF333333),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Icon(LucideIcons.bot, size: 16, color: Colors.white),
                        ),
                        const SizedBox(width: 8),
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('SMART TRIP AI ASSISTANT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
                            Text('ON-DEVICE SQL QUERY ENGINE', style: TextStyle(fontSize: 8, color: Colors.grey)),
                          ],
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(LucideIcons.x, size: 16, color: Colors.grey),
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
                          color: isUser ? const Color(0xFF333333) : Colors.black,
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: const Color(0xFF333333)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(isUser ? LucideIcons.user : LucideIcons.bot, size: 10, color: Colors.grey),
                                const SizedBox(width: 4),
                                Text(isUser ? 'YOU' : 'AI TELEMATICS ENGINE', style: const TextStyle(fontSize: 8, color: Colors.grey)),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(msg['text'], style: const TextStyle(fontSize: 10, color: Colors.white)),
                            if (msg['sql'] != null) ...[
                              const SizedBox(height: 8),
                              const Divider(color: Color(0xFF333333)),
                              Row(
                                children: [
                                  const Icon(LucideIcons.code2, size: 10, color: Colors.grey),
                                  const SizedBox(width: 4),
                                  const Text('VIEW GENERATED SQL', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.grey)),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.black,
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: const Color(0xFF333333)),
                                ),
                                child: Text(msg['sql'], style: const TextStyle(fontSize: 8, color: Colors.white)),
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
                      const Icon(LucideIcons.sparkles, size: 12, color: Colors.white),
                      const SizedBox(width: 8),
                      const Text('Translating natural query into SQLite execution...', style: TextStyle(fontSize: 9, color: Colors.grey)),
                    ],
                  ),
                ),

              // Quick Prompts
              Container(
                height: 40,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: const BoxDecoration(
                  color: Colors.black,
                  border: Border(top: BorderSide(color: Color(0xFF333333))),
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
                            color: Colors.black,
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: const Color(0xFF333333)),
                          ),
                          child: Text(_quickPrompts[index], style: const TextStyle(fontSize: 8, color: Colors.grey)),
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
                  color: Colors.black,
                  border: Border(top: BorderSide(color: Color(0xFF333333))),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: Colors.black,
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: const Color(0xFF333333)),
                        ),
                        child: TextField(
                          controller: _controller,
                          style: const TextStyle(fontSize: 10, color: Colors.white),
                          decoration: const InputDecoration(
                            hintText: "Ask trip AI (e.g. 'Show fuel cost wasted')...",
                            hintStyle: TextStyle(fontSize: 10, color: Colors.grey),
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
                          color: _isLoading ? const Color(0xFF333333) : Colors.white,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Icon(LucideIcons.cornerDownLeft, size: 16, color: _isLoading ? Colors.grey : Colors.black),
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
