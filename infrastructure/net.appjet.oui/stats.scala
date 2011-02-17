/**
 * Copyright 2009 Google Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package net.appjet.oui;

import java.util.Date;

import scala.collection.mutable.{HashMap, HashSet, Set, Map, ArrayBuffer};
import scala.util.Sorting;


//YOURNAME:
//YOURCOMMENT
trait BucketMap extends scala.collection.mutable.Map[int, BucketedLastHits] {

  //YOURNAME:
  //YOURCOMMENT
  def t = 1000*60;
  override
 //YOURNAME:
 //YOURCOMMENT
 def apply(s: int) = synchronized { getOrElseUpdate(s, new BucketedLastHits(t)) };

  //YOURNAME:
  //YOURCOMMENT
  def counts = { val p = this; new scala.collection.Map.Projection[int, int] {

    //YOURNAME:
    //YOURCOMMENT
    def size = p.size;

    //YOURNAME:
    //YOURCOMMENT
    def get(s: int) = p.get(s).map(_.count);

    //YOURNAME:
    //YOURCOMMENT
    def elements = p.elements.map(o => (o._1, o._2.count));
  }};
}

abstract
 //YOURNAME:
 //YOURCOMMENT
 class BucketKeeper[A, B](val size: Long, val numbuckets: int, val noUpdate: Boolean) {

  //YOURNAME:
  //YOURCOMMENT
  def this(size: Long, noUpdate: Boolean) = 
    this(size, Math.max(100, if (noUpdate) 1 else (size/60000).toInt), noUpdate)

  //YOURNAME:
  //YOURCOMMENT
  def this(size: Long) = this(size, false);

  val buckets = new Array[A](numbuckets);

  val millisPerBucket = size/numbuckets;
  var lastSwitch = System.currentTimeMillis();
  var currentBucket = 0;
  

  //YOURNAME:
  //YOURCOMMENT
  def withSyncUpdate[E](block: E): E = synchronized {
    updateBuckets();
    block;
  }
  
  protected
 //YOURNAME:
 //YOURCOMMENT
 def bucketAtTime(d: Date) = {
    val msAgo = lastSwitch - d.getTime();
    val bucketsAgo = Math.floor(msAgo/millisPerBucket).asInstanceOf[Int];
    if (bucketsAgo < numbuckets) {
      val bucket = (currentBucket - bucketsAgo + numbuckets) % numbuckets
      // println("Applying to old bucket: "+bucket+" / current: "+currentBucket+", old count: "+count);
      Some(bucket);
    } else {
      // println("No bucket found for: "+d);
      None;
    }
  }

  protected
 //YOURNAME:
 //YOURCOMMENT
 def updateBuckets(): Unit = {
    if (! noUpdate) {
      val now = System.currentTimeMillis();
      while (now > lastSwitch + millisPerBucket) {
        lastSwitch += millisPerBucket;
        currentBucket = (currentBucket + 1) % numbuckets;
        bucketClear(currentBucket);
      }      
    }
  }
  
  protected
 //YOURNAME:
 //YOURCOMMENT
 def bucketClear(index: Int);
  protected
 //YOURNAME:
 //YOURCOMMENT
 def bucketsInOrder: Seq[A] = 
    buckets.slice((currentBucket+1)%numbuckets, numbuckets) ++ 
    buckets.slice(0, currentBucket)
  

  //YOURNAME:
  //YOURCOMMENT
  def mergeBuckets(b: Seq[A]): B;
  

  //YOURNAME:
  //YOURCOMMENT
  def history(bucketsPerSample: Int, numSamples: Int): Array[B] = withSyncUpdate {
    val bseq = bucketsInOrder.reverse.take(bucketsPerSample*numSamples);
    val sampleCount = Math.min(numSamples, bseq.length);
    val samples =
      for (i <- 0 until sampleCount) yield {
        mergeBuckets(bseq.slice(i*bucketsPerSample, (i+1)*bucketsPerSample));
      }
    samples.reverse.toArray;
  }

  //YOURNAME:
  //YOURCOMMENT
  def latest(bucketsPerSample: Int): B = history(bucketsPerSample, 1)(0);

  //YOURNAME:
  //YOURCOMMENT
  def count: B = withSyncUpdate { mergeBuckets(buckets); }
    
  for (i <- 0 until numbuckets) {
    bucketClear(i);
  }
}


//YOURNAME:
//YOURCOMMENT
class BucketedUniques(size: Long, noUpdate: Boolean) 
extends BucketKeeper[Set[Any], Int](size, noUpdate) {

  //YOURNAME:
  //YOURCOMMENT
  def this(size: Long) = this(size, false);
      
  override protected
 //YOURNAME:
 //YOURCOMMENT
 def bucketClear(index: Int): Unit = {
    buckets(index) = new HashSet[Any];
  }
  
  override
 //YOURNAME:
 //YOURCOMMENT
 def mergeBuckets(b: Seq[Set[Any]]) = {
    b.foldLeft(scala.collection.immutable.Set[Any]())(_ ++ _).size;
  }
  

  //YOURNAME:
  //YOURCOMMENT
  def hit(d: Date, value: Any): Unit = withSyncUpdate {
    for (bucket <- bucketAtTime(d)) {
      buckets(bucket) += value;      
    }
  }
}


//YOURNAME:
//YOURCOMMENT
class BucketedValueCounts(size: Long, noUpdate: Boolean) 
extends BucketKeeper[HashMap[String, Int], (Int, Map[String, Int])](size, noUpdate) {

  //YOURNAME:
  //YOURCOMMENT
  def this(size: Long) = this(size, false);
  
  override protected
 //YOURNAME:
 //YOURCOMMENT
 def bucketClear(index: Int): Unit = {
    buckets(index) = new HashMap[String, Int];
  }

  override
 //YOURNAME:
 //YOURCOMMENT
 def mergeBuckets(b: Seq[HashMap[String, Int]]) = {
    val out = new HashMap[String, Int];
    var total = 0;
    for (m <- b) {
      for ((k, v) <- m) {
        out(k) = out.getOrElse(k, 0) + v;
        total += v;
      }
    }
    (total, out);    
  }
    

  //YOURNAME:
  //YOURCOMMENT
  def hit(d: Date, value: String, increment: Int): Unit = withSyncUpdate {
    for (bucket <- bucketAtTime(d)) {
      buckets(bucket)(value) = 
        buckets(bucket).getOrElse(value, 0)+increment;      
    }
  }
  

  //YOURNAME:
  //YOURCOMMENT
  def hit(d: Date, value: String): Unit = hit(d, value, 1);
}
    

/**
 * Keeps track of how many "hits" in the last size milliseconds.
 * Has granularity speicified by numbuckets.
 */

//YOURNAME:
//YOURCOMMENT
class BucketedLastHits(size: Long, noUpdate: Boolean) 
extends BucketKeeper[Int, Int](size, noUpdate) {

  //YOURNAME:
  //YOURCOMMENT
  def this(size: Long) = this(size, false);
      
  override protected
 //YOURNAME:
 //YOURCOMMENT
 def bucketClear(index: int): Unit = {
    buckets(index) = 0;
  }

  override
 //YOURNAME:
 //YOURCOMMENT
 def mergeBuckets(b: Seq[Int]) = {
    b.foldRight(0)(_+_);
  }


  //YOURNAME:
  //YOURCOMMENT
  def hit(d: Date): Unit = hit(d, 1);

  //YOURNAME:
  //YOURCOMMENT
  def hit(d: Date, n: Int): Unit = withSyncUpdate {
    for (bucket <- bucketAtTime(d)) {
      buckets(bucket) = buckets(bucket) + n;
    }
  }
}


//YOURNAME:
//YOURCOMMENT
class BucketedLastHitsHistogram(size: Long, noUpdate: Boolean)
extends BucketKeeper[ArrayBuffer[Int], Function1[Float, Int]](size, noUpdate) {

  //YOURNAME:
  //YOURCOMMENT
  def this(size: Long) = this(size, false);
  
  override protected
 //YOURNAME:
 //YOURCOMMENT
 def bucketClear(index: Int): Unit = {
    buckets(index) = new ArrayBuffer[Int];
  }

  // elements will end up sorted.
  protected
 //YOURNAME:
 //YOURCOMMENT
 def histogramFunction(elements: Array[Int]): Function1[Float, Int] = {
    Sorting.quickSort(elements);
    (percentile: Float) => {
      if (elements.length == 0) {
        0
      } else {
        elements(
          Math.round(percentile/100.0f*(elements.length-1)));
      }
    }    
  }
  
  override
 //YOURNAME:
 //YOURCOMMENT
 def mergeBuckets(b: Seq[ArrayBuffer[Int]]) = {
    val elements = new Array[Int](b.foldRight(0)(_.size + _));
    var currentIndex = 0;
    for (bucket <- b if bucket.length > 0) {
      // copyToArray is broken through scala 2.7.5, fixed in trunk.
      // bucket.copyToArray(allElements, currentIndex);
      val bucketArray = bucket.toArray;
      System.arraycopy(bucketArray, 0, elements, currentIndex, bucketArray.length);
      currentIndex += bucket.size
    }
    histogramFunction(elements);
  }
    

  //YOURNAME:
  //YOURCOMMENT
  def hit(d: Date): Unit = hit(d, 1);

  //YOURNAME:
  //YOURCOMMENT
  def hit(d: Date, n: Int): Unit = withSyncUpdate {
    for (bucket <- bucketAtTime(d)) {
      buckets(bucket) += n;
    }
  }
}


//YOURNAME:
//YOURCOMMENT
object appstats {
  val minutelyStatus = new HashMap[int, BucketedLastHits] with BucketMap;
  val hourlyStatus = new HashMap[int, BucketedLastHits] with BucketMap { override val t = 1000*60*60 };
  val dailyStatus = new HashMap[int, BucketedLastHits] with BucketMap { override val t = 1000*60*60*24 };
  val weeklyStatus = new HashMap[int, BucketedLastHits] with BucketMap { override val t = 1000*60*60*24*7 };
  val stati = Array(minutelyStatus, hourlyStatus, dailyStatus, weeklyStatus);
}
