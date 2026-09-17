import re
import httpx
from bs4 import BeautifulSoup


class FetchResult:
    def __init__(self, url: str, success: bool, content: str = "", error_message: str = "", source_name: str = ""):
        self.url = url
        self.success = success
        self.content = content
        self.error_message = error_message
        self.source_name = source_name


async def fetch_webpage(url: str) -> FetchResult:
    """
    Fetches an experience webpage and extracts cleaned, readable text content.
    """
    if not url or not (url.startswith("http://") or url.startswith("https://")):
        return FetchResult(
            url=url,
            success=False,
            error_message="Invalid URL format. URL must start with http:// or https://"
        )

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            
            if response.status_code >= 400:
                return FetchResult(
                    url=url,
                    success=False,
                    error_message=f"HTTP Error {response.status_code}: Unable to reach website."
                )

            html = response.text
            soup = BeautifulSoup(html, "html.parser")

            # Extract site/source name from domain or meta title
            from urllib.parse import urlparse
            domain = urlparse(url).netloc.replace("www.", "")
            source_name = domain.capitalize()

            # Remove unwanted tags (script, style, nav, footer, ads)
            for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript", "svg"]):
                tag.decompose()

            # Get clean text
            text = soup.get_text(separator="\n")
            
            # Clean up whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            cleaned_text = "\n".join(chunk for chunk in chunks if chunk)

            # Limit raw content size to prevent overwhelming LLM context
            if len(cleaned_text) > 8000:
                cleaned_text = cleaned_text[:8000] + "\n...[Content Truncated]"

            if len(cleaned_text.strip()) < 50:
                return FetchResult(
                    url=url,
                    success=False,
                    error_message="Webpage content appears empty or rendered via complex JavaScript."
                )

            return FetchResult(
                url=url,
                success=True,
                content=cleaned_text,
                source_name=source_name
            )

    except httpx.TimeoutException:
        return FetchResult(
            url=url,
            success=False,
            error_message="Connection timed out while trying to fetch the experience webpage."
        )
    except Exception as e:
        return FetchResult(
            url=url,
            success=False,
            error_message=f"Scraping error: {str(e)}"
        )
