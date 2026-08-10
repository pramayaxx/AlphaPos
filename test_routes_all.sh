for route in $(grep -ro "api\.[a-z]*('/[^']*'" src/ | awk -F"'" '{print $2}' | sort | uniq); do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api$route)
  if [ "$status" -eq 200 ]; then
    body=$(curl -s http://localhost:3000/api$route | head -c 15)
    if [[ "$body" == *"<!doctype"* ]]; then
      echo "FALLTHROUGH: $route"
    fi
  fi
done
