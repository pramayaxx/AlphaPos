grep -ro "api\.[a-z]*('/[^']*'" src/ | sort | uniq | while read line; do
  method=$(echo $line | awk -F'.' '{print $2}' | awk -F'(' '{print $1}')
  route=$(echo $line | awk -F"'" '{print $2}')
  
  if [ "$method" = "get" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer test" http://localhost:3000/api$route)
    if [ "$status" -eq 200 ]; then
      body=$(curl -s -H "Authorization: Bearer test" http://localhost:3000/api$route | head -c 15)
      if [[ "$body" == *"<!doctype"* ]]; then
        echo "MISSING GET: $route"
      fi
    fi
  elif [ "$method" = "post" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: Bearer test" -H "Content-Type: application/json" -d '{}' http://localhost:3000/api$route)
    if [ "$status" -eq 200 ]; then
      body=$(curl -s -X POST -H "Authorization: Bearer test" -H "Content-Type: application/json" -d '{}' http://localhost:3000/api$route | head -c 15)
      if [[ "$body" == *"<!doctype"* ]]; then
        echo "MISSING POST: $route"
      fi
    fi
  fi
done
