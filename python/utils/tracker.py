from litellm import completion_cost

class TokenTracker:
    def __init__(self):
        self.total_tokens = 0
        self.total_cost = 0.0

    def update(self, response_obj):
        """Cập nhật usage từ response của Embedding"""
        if hasattr(response_obj, 'usage'):
            usage = response_obj.usage
            tokens = getattr(usage, 'prompt_tokens', 0)
            self.total_tokens += tokens
            
            try:
                cost = completion_cost(completion_response=response_obj)
                self.total_cost += cost
            except:
                self.total_cost += (tokens / 1000) * 0.00002