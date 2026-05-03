import '../../../../core/models/request_type.dart';
import '../../../../core/constants/constants.dart';

class RequestFormData {
  RequestType? type;
  String? intent;
  String? category;
  String? constructionStatus;
  String? bankLoan;
  String? customization;
  String? targetRoom;
  String? paymentPlan;
  String? bedrooms;
  String kifleKetema;
  String wereda;
  String address;
  int budgetMax;
  String notes;

  RequestFormData({
    this.type,
    this.intent,
    this.category,
    this.constructionStatus,
    this.bankLoan,
    this.customization,
    this.targetRoom,
    this.paymentPlan,
    this.bedrooms,
    this.kifleKetema = '',
    this.wereda = '',
    this.address = '',
    this.budgetMax = 1000000,
    this.notes = '',
  });

  RequestFormData copyWith({
    RequestType? type,
    String? intent,
    String? category,
    String? constructionStatus,
    String? bankLoan,
    String? customization,
    String? targetRoom,
    String? paymentPlan,
    String? bedrooms,
    String? kifleKetema,
    String? wereda,
    String? address,
    int? budgetMax,
    String? notes,
  }) {
    return RequestFormData(
      type: type ?? this.type,
      intent: intent ?? this.intent,
      category: category ?? this.category,
      constructionStatus: constructionStatus ?? this.constructionStatus,
      bankLoan: bankLoan ?? this.bankLoan,
      customization: customization ?? this.customization,
      targetRoom: targetRoom ?? this.targetRoom,
      paymentPlan: paymentPlan ?? this.paymentPlan,
      bedrooms: bedrooms ?? this.bedrooms,
      kifleKetema: kifleKetema ?? this.kifleKetema,
      wereda: wereda ?? this.wereda,
      address: address ?? this.address,
      budgetMax: budgetMax ?? this.budgetMax,
      notes: notes ?? this.notes,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type?.name,
      'intent': intent,
      'category': category,
      'constructionStatus': constructionStatus,
      'bankLoan': bankLoan,
      'customization': customization,
      'targetRoom': targetRoom,
      'paymentPlan': paymentPlan,
      'bedrooms': bedrooms,
      'kifleKetema': kifleKetema,
      'wereda': wereda,
      'address': address,
      'budgetMax': budgetMax,
      'notes': notes,
    };
  }

  factory RequestFormData.fromJson(Map<String, dynamic> json) {
    RequestType? parsedType;
    if (json['type'] != null) {
      parsedType = RequestType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => RequestType.furniture,
      );
    }
    
    return RequestFormData(
      type: parsedType,
      intent: json['intent'],
      category: json['category'],
      constructionStatus: json['constructionStatus'],
      bankLoan: json['bankLoan'],
      customization: json['customization'],
      targetRoom: json['targetRoom'],
      paymentPlan: json['paymentPlan'],
      bedrooms: json['bedrooms'],
      kifleKetema: json['kifleKetema'] ?? '',
      wereda: json['wereda'] ?? '',
      address: json['address'] ?? '',
      budgetMax: json['budgetMax'] ?? 1000000,
      notes: json['notes'] ?? '',
    );
  }

  Map<String, dynamic> toBackendPayload() {
    final isHome = type == RequestType.realEstate;
    final isFurniture = type == RequestType.furniture;

    final zoneLabel = kKifleKetemas
        .firstWhere((k) => k.value == kifleKetema, orElse: () => kKifleKetemas.first)
        .label;

    return {
      'category': isHome ? 'Home' : 'Furniture',
      'type': isHome ? 'real_estate' : 'furniture',
      'details': {
        'title': isHome
            ? '${bedrooms ?? ''} Bedroom Home in $zoneLabel'
            : 'Furniture for ${targetRoom ?? 'Room'}',
        'description': notes,
        'budgetMax': budgetMax,
      },
      'metadata': {
        'intent': intent,
        if (isHome) 'constructionStatus': constructionStatus,
        if (isHome) 'bedrooms': bedrooms,
        if (isHome) 'bankLoan': bankLoan,
        if (isFurniture) 'customization': customization,
        if (isFurniture) 'targetRoom': targetRoom,
        if (isFurniture) 'paymentPlan': paymentPlan,
      },
      'locationZone': {
        'kifleKetema': zoneLabel,
        'woreda': wereda,
      },
    };
  }
}
