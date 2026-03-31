#!/bin/bash
# Run the scraper in batches of 10 clients
# Each batch gets a fresh browser to avoid memory issues

export PATH=/usr/local/bin:$PATH
cd "$(dirname "$0")"

BATCH_SIZE=10
TOTAL_CLIENTS=50  # Update when we add pagination for all 156

echo "🎨 STYLED Boulevard Scraper — Batch Runner"
echo "   Batch size: $BATCH_SIZE"
echo "   Total clients: $TOTAL_CLIENTS"
echo ""

for ((i=0; i<TOTAL_CLIENTS; i+=BATCH_SIZE)); do
  BATCH_NUM=$(( (i / BATCH_SIZE) + 1 ))
  END=$(( i + BATCH_SIZE ))
  if [ $END -gt $TOTAL_CLIENTS ]; then END=$TOTAL_CLIENTS; fi

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 Batch $BATCH_NUM: Clients $((i+1))-$END"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  SKIP_CLIENTS=$i MAX_CLIENTS=$BATCH_SIZE node scrape.js 2>&1 | tee -a scrape-batch.log

  EXIT_CODE=$?
  if [ $EXIT_CODE -ne 0 ]; then
    echo "⚠️  Batch $BATCH_NUM exited with code $EXIT_CODE"
    echo "   Waiting 10 seconds before retrying..."
    sleep 10
    # Retry once
    SKIP_CLIENTS=$i MAX_CLIENTS=$BATCH_SIZE node scrape.js 2>&1 | tee -a scrape-batch.log
  fi

  echo ""
  echo "   Batch $BATCH_NUM done. Waiting 5 seconds before next batch..."
  sleep 5
done

echo ""
echo "🎉 All batches complete!"
echo "   Check scrape-batch.log for full output"
echo "   Check styled.megandkev.co for imported data"
