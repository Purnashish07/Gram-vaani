# Simple intent + response generator for GramVaani
def generate_voice_response(schemes, user_query, lang='hi'):
    if not schemes:
        if 'hi' in lang or any('\u0900' <= c <= '\u097F' for c in user_query):
            return "माफ़ कीजिए, इससे जुड़ी कोई योजना नहीं मिली। आप 'किसान योजना', 'आवास योजना', 'गैस योजना' जैसे शब्द बोल कर देखिए।"
        else:
            return "Sorry, no scheme found for your query. Try saying Kisan Yojana, Awas Yojana, Gas Yojana etc."
    
    top = schemes[0]
    if 'hi' in lang or any('\u0900' <= c <= '\u097F' for c in user_query):
        # Convert documents list to a nice Hindi string
        docs = ', '.join(top.get('documents', [])) if isinstance(top.get('documents'), list) else top.get('documents', 'ज़रूरी दस्तावेज़')
        
        resp = f"{top.get('name_hi', top.get('name', 'योजना'))} के बारे में जानकारी मिली है। " \
               f"लाभ: {top.get('benefits', '')}। " \
               f"योग्यता: {top.get('eligibility', '')}। " \
               f"ज़रूरी कागज़: {docs}। " \
               f"आप इसकी आधिकारिक वेबसाइट पर आवेदन कर सकते हैं।"
    else:
        docs = ', '.join(top.get('documents', [])) if isinstance(top.get('documents'), list) else top.get('documents', 'N/A')
        resp = f"Found scheme: {top.get('name', '')}. " \
               f"Benefit: {top.get('benefits', '')}. " \
               f"Eligibility: {top.get('eligibility', '')}. " \
               f"Documents needed: {docs}. " \
               f"You can apply on their official website."
    
    if len(schemes) > 1:
        if 'hi' in lang or any('\u0900' <= c <= '\u097F' for c in user_query):
            other_names = ", ".join([s.get('name_hi', s.get('name', '')) for s in schemes[1:]])
            resp += f" इसके अलावा {other_names} भी उपलब्ध हैं।"
        else:
            other_names = ", ".join([s.get('name', '') for s in schemes[1:]])
            resp += f" Also found: {other_names}."
    
    return resp