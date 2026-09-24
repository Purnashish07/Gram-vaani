import json
from rapidfuzz import fuzz, process

class SchemeFinder:
    def __init__(self, json_path='schemes_data.json'):
        with open(json_path, 'r', encoding='utf-8') as f:
            self.schemes = json.load(f)
        # build keyword map
        self.all_texts = []
        for s in self.schemes:
            text = s['name'] + " " + s['name_hi'] + " " + " ".join(s['keywords']) + " " + s['category']
            self.all_texts.append(text)

    def find(self, query, threshold=55):
        query = query.lower().strip()
        if not query:
            return []
        
        # Direct keyword match
        results = []
        for idx, scheme in enumerate(self.schemes):
            score = fuzz.WRatio(query, self.all_texts[idx])
            # Also check individual keywords
            for kw in scheme['keywords']:
                if kw.lower() in query or query in kw.lower():
                    score = max(score, 85)
            if score >= threshold:
                results.append((scheme, score))
        
        results.sort(key=lambda x: x[1], reverse=True)
        return [r[0] for r in results[:3]]

    def get_by_id(self, id):
        for s in self.schemes:
            if s['id'] == id:
                return s
        return None

finder = SchemeFinder()
